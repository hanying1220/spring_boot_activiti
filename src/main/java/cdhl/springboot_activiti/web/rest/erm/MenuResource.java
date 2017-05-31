package cdhl.springboot_activiti.web.rest.erm;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;

import cdhl.springboot_activiti.domain.enums.MenuEnum;
import cdhl.springboot_activiti.domain.enums.SystemEnum;
import cdhl.springboot_activiti.domain.erm.Menu;
import cdhl.springboot_activiti.domain.erm.MenuAction;
import cdhl.springboot_activiti.repository.SystemEnumRepository;
import cdhl.springboot_activiti.service.erm.MenuService;
import cdhl.springboot_activiti.web.rest.util.HeaderUtil;
import cdhl.springboot_activiti.web.rest.util.PaginationUtil;

/**
 * Created by Administrator on 2016/12/8.
 */
@RestController
@RequestMapping("/api/erm")
public class MenuResource {

    private final Logger log = LoggerFactory.getLogger(MenuResource.class);

    @Autowired
    private MenuService menuService;

    @Autowired
    private SystemEnumRepository systemEnumRepository;


    @RequestMapping(value = "/menu",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Menu> createMenu(@RequestBody Menu menu) throws URISyntaxException {
        log.debug("REST request to save Menu : {}", menu);
        if (menu.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("menu", "idexists", "A new menu cannot already have an ID")).body(null);
        }
        Menu result = menuService.save(menu);



        return ResponseEntity.created(new URI("/api/erm/menu/" + menu.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("menu", menu.getId().toString()))
                .body(result);
    }


    @RequestMapping(value = "/menu/{id}",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Menu> updateMenu(@RequestBody Menu menu) throws URISyntaxException {
        log.debug("REST request to update Menu : {}", menu);
        if (menu.getId() == null) {
            return createMenu(menu);
        }
        Menu result = menuService.save(menu);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("menu", menu.getId().toString()))
                .body(result);
    }

    @RequestMapping(value = "/menu",
        method = RequestMethod.GET,
       params = {"parentId"})
    @Timed
    public ResponseEntity<List<Menu>> getAllMenusByParentId(@RequestParam(value = "parentId") Long parentId,Pageable pageable)
        throws URISyntaxException {
        Page<Menu>  page;
        if(parentId.compareTo(new Long(0))>0){
            page = menuService.findAllByParentId(pageable, parentId);
        }else {
            page = menuService.findAllByParentId(pageable, null);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/menu");
        return new ResponseEntity<List<Menu>>(page.getContent(), headers, HttpStatus.OK);
    }

    @RequestMapping(value = "/menu/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Menu> getMenu(@PathVariable Long id) {
        log.debug("REST request to get UserAccount : {}", id);
        Menu menu = menuService.findOne(id);
        return Optional.ofNullable(menu)
                .map(result -> new ResponseEntity<>(
                        result,
                        HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @RequestMapping(value = "/menu/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        log.debug("REST request to delete Menu : {}", id);
        menuService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("menu", id.toString())).build();
    }


    /*编辑菜单调用*/
    @RequestMapping(value = "/findMenuById",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Menu> findMenuById(Long id) {
        Menu menu = menuService.findOne(id);
        return Optional.ofNullable(menu)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    /*更加上下级获取菜单（菜单管理导航树）*/
    @RequestMapping(value = "/findAllMenu",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Menu>> findAllMenu(Long id) {
        return new ResponseEntity(menuService.findAllByParentId(id),HttpStatus.OK) ;
    }

    /*获取菜单下的动作点*/
    @RequestMapping(value = "/findAllByMenuId",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<MenuAction>> findAllMenuActionByMenu(Long id) {
        return new ResponseEntity(menuService.findAllByMenuId(id), HttpStatus.OK) ;
    }

    /*获取系统动作点*/
    @RequestMapping(value = "/findMenuActions",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<SystemEnum>> findMenuActions() {
        List<SystemEnum> list = systemEnumRepository.findAllByParent(MenuEnum.class.getSimpleName());
        return new ResponseEntity(list,HttpStatus.OK) ;
    }



    /**************************已下涉及菜单权限*************************************/
    /*（菜单导航加载调用）*/
    /*获取用户拥有的菜单*/
    @RequestMapping(value = "/findUserMenus",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<Menu>> findUserMenus() {
        List<Menu> list = menuService.findUserMenus();
        return new ResponseEntity(list,HttpStatus.OK) ;
    }

    /*获取当前用户所在菜单 角色的动作点*/
    @RequestMapping(value = "/findRoleActionsByMenu",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<MenuAction>> findRoleActionsByMenu(String menulink) {
        List<MenuAction> list =menuService.findUserActionsByMenuName(menulink);
        return new ResponseEntity(list,HttpStatus.OK) ;
    }



}
