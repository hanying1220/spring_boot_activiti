package cdhl.springboot_activiti.security;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.hibernate.Filter;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import cdhl.springboot_activiti.domain.erm.User;
import cdhl.springboot_activiti.repository.erm.UserRepository;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailService")
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(UserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String login) {
        log.debug("Authenticating {}", login);


        String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);

        String args[] = StringUtils.split(lowercaseLogin, "/");
        String username = login;
        String tenantCode = null;
        if(args != null && args.length > 1){
            username = args[0];
            tenantCode = args[1];
        }
        final String userIdenty = username;
        final String fTenantCode = tenantCode;
        Filter filter = (Filter)entityManager.unwrap(Session.class).enableFilter("tenantCodeFilter");
        filter.setParameter("tenantCode",tenantCode);
        Optional<User> userFromDatabase = userRepository.findOneByLogin(username);
        entityManager.unwrap(Session.class).disableFilter("tenantCodeFilter");
        return userFromDatabase.map(user -> {
            if (!user.getActivated()) {
                throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
            }
            List<GrantedAuthority> grantedAuthorities = user.getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                .collect(Collectors.toList());
            UserTenant userTenant = new UserTenant(userIdenty,
                user.getPassword(),
                grantedAuthorities);
            userTenant.setTenantCode(fTenantCode);
            return userTenant;
        }).orElseThrow(() -> new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the " +
            "database"));
    }
}
