package cdhl.springboot_activiti.web.rest;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;

import cdhl.springboot_activiti.domain.erm.Menu;
import cdhl.springboot_activiti.domain.erm.User;
import cdhl.springboot_activiti.repository.erm.UserRepository;
import cdhl.springboot_activiti.service.erm.MenuService;

/**
 * Created by Administrator on 2017/1/5.
 */

@RestController
@RequestMapping("/api/admin")
public class AdminResource {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuService menuService;

    @RequestMapping(value = "/findAllUsers",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<User>> findAllUsers(Pageable pageable) throws URISyntaxException {
        Sort sort = new Sort(Sort.Direction.ASC, "tenancyCode");
        pageable=new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Page<User> list = userRepository.findAll(pageable);
        return new ResponseEntity(list, HttpStatus.OK);
    }


    @RequestMapping(value = "/findUserByLogin",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<User> findUserByLogin(String login) throws URISyntaxException {
        Optional<User> optional = userRepository.findOneByLogin(login);
        return new ResponseEntity(optional.get(), HttpStatus.OK);
    }


    @RequestMapping(value = "/updateUserActivated",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<User> updateUserActivated(Long id,Boolean activated) throws URISyntaxException {
        User user = userRepository.findOne(id);
        user.setActivated(activated);
        userRepository.save(user);
       return new ResponseEntity(user, HttpStatus.OK);
    }


    @RequestMapping(value = "/findAllMenus",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Menu>> findAllMenus() throws URISyntaxException {
        List<Menu> list = menuService.findAll();

        return new ResponseEntity(list, HttpStatus.OK);
    }


}
