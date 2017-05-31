package cdhl.springboot_activiti.service.erm;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.Authority;
import cdhl.springboot_activiti.domain.erm.Organization;
import cdhl.springboot_activiti.domain.erm.Role;
import cdhl.springboot_activiti.domain.erm.User;
import cdhl.springboot_activiti.repository.AuthorityRepository;
import cdhl.springboot_activiti.repository.erm.OrganizationRepository;
import cdhl.springboot_activiti.repository.erm.PersistentTokenRepository;
import cdhl.springboot_activiti.repository.erm.RoleRepository;
import cdhl.springboot_activiti.repository.erm.RoleUserRepository;
import cdhl.springboot_activiti.repository.erm.UserRepository;
import cdhl.springboot_activiti.security.AuthoritiesConstants;
import cdhl.springboot_activiti.security.SecurityUtils;
import cdhl.springboot_activiti.service.ActivitiService;
import cdhl.springboot_activiti.service.ItenantService;
import cdhl.springboot_activiti.service.util.RandomUtil;
import cdhl.springboot_activiti.web.rest.vm.ManagedUserVM;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService implements ItenantService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleUserRepository roleUserRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PersistentTokenRepository persistentTokenRepository;

    @Autowired
    private AuthorityRepository authorityRepository;
    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private ActivitiService activitiService;


    public User save(User user){
        return userRepository.save(user);
    }

    public Page<User> findAll(Long orgzId,Pageable pageable,String searchName) {
        Page<User> page=null;
        if(orgzId!=null){
            Long[] longArr=organizationRepository.findIdByParentId(orgzId);
            log.info(longArr.toString());
            if(searchName==null||searchName.equals("")){
                page=userRepository.findAllByOrganizationIdIn(pageable,longArr);
            }else{
                page=userRepository.findAllByOrganizationIdInAndNameLike(pageable, longArr, "%"+searchName+"%");
            }
        }else{
            if(searchName==null||searchName.equals("")){
                page=userRepository.findAll(pageable);
            }else{
                page=userRepository.findAllByNameLike(pageable, "%"+searchName+"%");
            }
        }
        return page;
    }

    public List<User> findAll(Long orgzId) {
        if(orgzId!=null){
            Long[] longArr=organizationRepository.findIdByParentId(orgzId);
            log.info(longArr.toString());
            return userRepository.findByOrganizationIdIn(longArr);
        }else{
            return userRepository.findAll();
        }

    }
    public Optional<User> activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        return userRepository.findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                userRepository.save(user);
                log.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
       log.debug("Reset user password for reset key {}", key);

       return userRepository.findOneByResetKey(key)
            .filter(user -> {
                ZonedDateTime oneDayAgo = ZonedDateTime.now().minusHours(24);
                return user.getResetDate().isAfter(oneDayAgo);
            })
           .map(user -> {
               user.setPassword(passwordEncoder.encode(newPassword));
               user.setResetKey(null);
               user.setResetDate(null);
               userRepository.save(user);
               return user;
           });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository.findOneByEmail(mail)
            .filter(User::getActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(ZonedDateTime.now());
                userRepository.save(user);
                return user;
            });
    }

    public User createUser(String login, String password, String name, String email,
        String langKey,String tenancyCode,String orgName) {

        Organization org = new Organization();

        org.setName(orgName);
        org.setTenancyCode(tenancyCode);
        org.setOrgzType(1);

        organizationRepository.save(org);


        User newUser = new User();
        Authority authority = authorityRepository.findOne(AuthoritiesConstants.TENANT_ADMIN);
        Set<Authority> authorities = new HashSet<>();
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(login);
        if(StringUtils.isNotBlank(name)){
            newUser.setName(name);
        }else {
            newUser.setName(login);
        }
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setEmail(email);
        newUser.setLangKey(langKey);
        newUser.setTenancyCode(tenancyCode);
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        authorities.add(authority);
        newUser.setAuthorities(authorities);

        newUser.setOrganization(org);
        userRepository.save(newUser);

        //add activiti user
        addActivitiUser(newUser);

        log.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    public User createUser(ManagedUserVM managedUserVM) {
        User user = new User();
        user.setLogin(managedUserVM.getLogin());
        if(StringUtils.isNotBlank(managedUserVM.getName())){
            user.setName(managedUserVM.getName());
        }else {
            user.setName(managedUserVM.getLogin());
        }
        user.setEmail(managedUserVM.getEmail());
        if (managedUserVM.getLangKey() == null) {
            user.setLangKey("zh-cn"); // default language
        } else {
            user.setLangKey(managedUserVM.getLangKey());
        }
        if (managedUserVM.getAuthorities() != null) {
            Set<Authority> authorities = new HashSet<>();
            managedUserVM.getAuthorities().stream().forEach(
                authority -> authorities.add(authorityRepository.findOne(authority))
            );
            user.setAuthorities(authorities);
        }
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(ZonedDateTime.now());
        user.setActivated(true);
        userRepository.save(user);
        log.debug("Created Information for User: {}", user);
        return user;
    }
    public User addUser(User user ) {

        if (user.getLangKey() == null) {
            user.setLangKey("zh-cn"); // default language
        }
        String encryptedPassword = passwordEncoder.encode("123456");
        Authority authority = authorityRepository.findOne(AuthoritiesConstants.TENANT_USER);
        Set<Authority> authorities = new HashSet<>();
        authorities.add(authority);
        user.setAuthorities(authorities);
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(ZonedDateTime.now());
        user.setActivated(false);
        log.debug("Created Information for User: {}", user);

        user=userRepository.save(user);

        addActivitiUser(user);
        return user;
    }
    public Boolean findOneByLogin(String login){
        return userRepository.findOneByLogin(login).isPresent();
    }

    public void updateUser(String name, String email, String langKey) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(u -> {
            u.setName(name);
            u.setEmail(email);
            u.setLangKey(langKey);
            userRepository.save(u);
            log.debug("Changed Information for User: {}", u);
        });
    }
    public void updateUser(User user) {
        userRepository.
            findOneById(user.getId())
            .ifPresent(u -> {
                u.setCode(user.getCode());
                u.setName(user.getName());
                u.setIdCard(user.getIdCard());
                u.setPhone(user.getPhone());
                u.setEmail(user.getEmail());
                u.setGender(user.getGender());
                u.setTelePhone(user.getTelePhone());
                u.setBirthday(user.getBirthday());
                u.setQqNum(user.getQqNum());
                u.setActivated(user.getActivated());
                u.setImageUrl(user.getImageUrl());
                if (user.getPassword() != null && !user.getPassword().equals("")) {
                    u.setPassword(passwordEncoder.encode(user.getPassword()));
                }
                User newUser = userRepository.save(u);
                log.debug("Changed Information for User: {}", u);
            });
    }
    public void updateUser(Long id, String login, String name,  String email,
        boolean activated, String langKey, Set<String> authorities) {

        userRepository
            .findOneById(id)
            .ifPresent(u -> {
                u.setLogin(login);
                u.setName(name);
                u.setEmail(email);
                u.setActivated(activated);
                u.setLangKey(langKey);
                Set<Authority> managedAuthorities = u.getAuthorities();
                managedAuthorities.clear();
                authorities.stream().forEach(
                    authority -> managedAuthorities.add(authorityRepository.findOne(authority))
                );


                log.debug("Changed Information for User: {}", u);
            });
    }

    public void deleteUser(String login) {
        userRepository.delete(Long.parseLong(login));
    }

    public void changePassword(String password) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(u -> {
            String encryptedPassword = passwordEncoder.encode(password);
            u.setPassword(encryptedPassword);
            userRepository.save(u);
            log.debug("Changed password for User: {}", u);
        });
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneByLogin(login).map(u -> {
            u.getAuthorities().size();
            return u;
        });
    }

    @Transactional(readOnly = true)
    public User getUserWithAuthorities(Long id) {
        User user = userRepository.findOne(id);
        user.getAuthorities().size(); // eagerly load the association
        return user;
    }

    @Transactional(readOnly = true)
    public User getUserWithAuthorities() {
        Optional<User> optionalUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin());
        User user = null;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            user.getAuthorities().size(); // eagerly load the association
        }
         return user;
    }

    /**
     * Persistent Token are used for providing automatic authentication, they should be automatically deleted after
     * 30 days.
     * <p>
     * This is scheduled to get fired everyday, at midnight.
     * </p>
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void removeOldPersistentTokens() {
        LocalDate now = LocalDate.now();
        persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1)).stream().forEach(token -> {
            log.debug("Deleting token {}", token.getSeries());
            User user = token.getUser();
            user.getPersistentTokens().remove(token);
            persistentTokenRepository.delete(token);
        });
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     * </p>
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        ZonedDateTime now = ZonedDateTime.now();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
        for (User user : users) {
            log.debug("Deleting not activated user {}", user.getLogin());
            userRepository.delete(user);
        }
    }

    public void resetPassword(Long id) {
        userRepository.findOneById(id)
            .ifPresent(u -> {
                u.setPassword(passwordEncoder.encode("123456"));
                userRepository.save(u);
                log.debug("Changed Information for User: {}", u);
            });
    }

    public User findById(Long id) {
       return  userRepository.findById(id);
    }



    public List<Role> findAllRole(Long id,Boolean flag) {
        Long[] roleIds=roleUserRepository.findRoleIdByUserId(id);
        if(flag){
            return roleRepository.findByIdIn(roleIds);
        }else {
            if(roleIds.length>0){
                return roleRepository.findByIdNotIn(roleIds);
            }else{
                return roleRepository.findAll();
            }

        }

    }

    public void addUserRole(User user) {
        roleUserRepository.deleteUserAllRole(user.getId());
        userRepository
            .findOneById(user.getId())
            .ifPresent(u -> {
                u.setRoles(user.getRoles());
                userRepository.save(u);
                log.debug("Changed Information for User: {}", u);
            });
    }

    public List<User> findByOrganizationId(Long id) {
       return userRepository.findAllByOrganizationId(id);
    }

    private void addActivitiUser(User user){
        //activitiService.saveUser(user,true);
    }
    private void addActivitiMembership(User user){
//        List<Role> list=new ArrayList<Role>();
//        for (RoleUser roleUser : user.getRoles()){
//            list.add(roleUser.getRole());
//        }
//        activitiService.saveMemberShip(user, list, true);
    }
    private void deleteActivitiUser(Long userId){
        //activitiService.deleteUser(userId.toString());
    }

}
