package cdhl.springboot_activiti.web.rest.erm;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;

import cdhl.springboot_activiti.config.Constants;
import cdhl.springboot_activiti.domain.erm.Role;
import cdhl.springboot_activiti.domain.erm.User;
import cdhl.springboot_activiti.repository.erm.UserRepository;
import cdhl.springboot_activiti.service.MailService;
import cdhl.springboot_activiti.service.erm.UserService;
import cdhl.springboot_activiti.web.rest.util.HeaderUtil;
import cdhl.springboot_activiti.web.rest.util.PaginationUtil;
import cdhl.springboot_activiti.web.rest.vm.ManagedUserVM;

/**
 * 用户管理
 */
@RestController("ermUserResource")
@RequestMapping("/api")
public class UserResource {

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserService userService;


    /**
     * GET  /users : get all users.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and with body all users
     * @throws URISyntaxException if the pagination headers couldn't be generated
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<ManagedUserVM>> getAllUsers(Pageable pageable)
        throws URISyntaxException {
        Page<User> page = userRepository.findAllWithAuthorities(pageable);
        List<ManagedUserVM> managedUserVMs = page.getContent().stream()
            .map(ManagedUserVM::new)
            .collect(Collectors.toList());
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/users");
        return new ResponseEntity<>(managedUserVMs, headers, HttpStatus.OK);
    }

    /**
     * GET  /users/:login : get the "login" user.
     *
     * @param login the login of the user to find
     * @return the ResponseEntity with status 200 (OK) and with body the "login" user, or with status 404 (Not Found)
     */
    @RequestMapping(value = "/users/{login:" + Constants.LOGIN_REGEX + "}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ManagedUserVM> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return userService.getUserWithAuthoritiesByLogin(login)
                .map(ManagedUserVM::new)
                .map(managedUserVM -> new ResponseEntity<>(managedUserVM, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE /users/:login : delete the "login" User.
     *
     * @param login the login of the user to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @RequestMapping(value = "/users/{id:" + Constants.LOGIN_REGEX + "}",
        method = RequestMethod.DELETE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        log.debug("REST request to delete User: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok().headers(HeaderUtil.createAlert("userManagement.deleted", id)).build();
    }

    @RequestMapping(value = "/users",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<User> addUser(@RequestBody User user) throws URISyntaxException {
        log.debug("REST request to save Menu : {}");
        if(userService.findOneByLogin(user.getLogin())){
            return ResponseEntity.created(new URI("/api/erm/menu/"))
                .headers(HeaderUtil.createEntityCreationAlert("menu",""))
                .body(user);
        }
        User newUser = userService.addUser(user);
        return ResponseEntity.created(new URI("/api/erm/menu/" + newUser.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("menu", newUser.getId().toString()))
            .body(newUser);
    }
    @RequestMapping(value = "/users/{id}",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<User> updateUser(@RequestBody User user) throws URISyntaxException {
        log.debug("REST request to save Menu : {}");
        userService.updateUser(user);
        return ResponseEntity.created(new URI("/api/erm/menu/" + user.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("menu", user.getId().toString()))
            .body(user);
    }
    @RequestMapping(value = "/userInfo/resetPassword",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Object> resetPassword(Long id) throws URISyntaxException {
        log.debug("REST request to save Menu : {}");

         userService.resetPassword(id);
        return new ResponseEntity(null,HttpStatus.OK);
    }
    @RequestMapping(value = "/userInfo/findAll",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Page<User>> findAll(Long orgzId,Pageable pageable,String searchName) throws URISyntaxException {
        log.debug("REST request to save Menu : {}");
        Sort sort = new Sort(Sort.Direction.DESC, "createdDate");
        pageable=new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Page<User> result = userService.findAll(orgzId,pageable,searchName);
        return ResponseEntity.created(new URI("/api/erm/menu/" + result.getTotalPages()+""))
            .headers(HeaderUtil.createEntityCreationAlert("menu", result.getTotalPages()+""))
            .body(result);
    }

    @RequestMapping(value = "/user/findAllRole",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Role>> findAllRole(Long id,Boolean flag) throws URISyntaxException {
        log.debug("REST request to save Menu : {}");
        List<Role> result = userService.findAllRole(id,flag);
        return ResponseEntity.created(new URI("/api/erm/menu/" + result.size()+""))
            .headers(HeaderUtil.createEntityCreationAlert("menu", result.size()+""))
            .body(result);
    }
    @RequestMapping(value = "/user/addUserRole",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Role>> addUserRole(@RequestBody User user) throws URISyntaxException {

        userService.addUserRole(user);
        log.debug("REST request to save Menu : {}");
        return null;
    }
}
