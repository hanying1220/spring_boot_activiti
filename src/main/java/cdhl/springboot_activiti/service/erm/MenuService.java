package cdhl.springboot_activiti.service.erm;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.Authority;
import cdhl.springboot_activiti.domain.erm.Menu;
import cdhl.springboot_activiti.domain.erm.MenuAction;
import cdhl.springboot_activiti.domain.erm.RoleMenu;
import cdhl.springboot_activiti.domain.erm.RoleMenuAction;
import cdhl.springboot_activiti.domain.erm.RoleUser;
import cdhl.springboot_activiti.domain.erm.User;
import cdhl.springboot_activiti.repository.erm.MenuActionRepository;
import cdhl.springboot_activiti.repository.erm.MenuRepository;
import cdhl.springboot_activiti.repository.erm.RoleMenuRepository;
import cdhl.springboot_activiti.repository.erm.UserRepository;
import cdhl.springboot_activiti.security.AuthoritiesConstants;
import cdhl.springboot_activiti.security.SecurityUtils;

/**
 * Created by Administrator on 2016/12/8.
 */

@Service
@Transactional
public class MenuService {

    private final Logger log = LoggerFactory.getLogger(Menu.class);

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private MenuActionRepository menuActionRepository;

    @Autowired
    private RoleMenuRepository roleMenuRepository;

    @Autowired
    private UserRepository userRepository;

    public void  deleteAllInBatch(){
        menuRepository.deleteAllInBatch();
    }

    public List<Menu> save(List<Menu> list){
      return   menuRepository.save(list);
    }

    public Menu save(Menu menu) {
        if(menu.getParent()==null){
            menu.setType("group");
        }else {
            menu.setType("item");
        }
        for(MenuAction action : menu.getActions()){
            if(action.getMenu()==null){
                action.setMenu(menu);
            }
        }
        Menu result = menuRepository.save(menu);
        return result;
    }

    @Transactional(readOnly = true)
    public Page<Menu> findAll(Pageable pageable) {
        Page<Menu> result = menuRepository.findAll(pageable);
        return result;
    }

    @Transactional(readOnly = true)
    public Page<Menu> findAllByParentId(Pageable pageable,Long id) {
        Page<Menu> result = menuRepository.findAllByParentId(pageable, id);
        return result;
    }

    @Transactional(readOnly = true)
    public List<Menu> findAll() {
        List<Menu> result = menuRepository.findAll();
        return result;
    }

    @Transactional(readOnly = true)
    public List<Menu> findAllByParentId(Long id){
        Sort sort=new Sort(Sort.Direction.ASC,"code");
        List<Menu> result = menuRepository.findAllByParentId(id, sort);
        return result;
    }

    @Transactional(readOnly = true)
    public List<MenuAction> findAllByMenuId(Long menuId){
        List<MenuAction> result = menuActionRepository.findAllByMenuId(menuId);
        return result;
    }

    @Transactional(readOnly = true)
    public Menu findOne(Long id) {
        Menu menu = menuRepository.findOne(id);
        menu.getActions().size();
        return menu;
    }

    @Transactional(readOnly = true)
    public Menu findOneByPath(String path) {
        Menu menu = menuRepository.findOneByPath(path);
        menu.getActions().size();
        return menu;
    }


    public void delete(Long id) {
        menuRepository.delete(id);
    }

    /*获取所有子级菜单*/
    public List<Menu> findAllMenuItems(){
        List<Menu> result = menuRepository.findAllMenuItems();
        return result;
    }




    /************  以下查询 涉及到权限
     * 根据不同的角色
     * 获取菜单权限
     * 及其动作点
     * *********************/


    /*更加当前角色获取子级菜单 */
    public List<Menu> findAllItems(){
        List<Menu> result =  menuRepository.findAllByParentNotNullAndParamContaining(AuthoritiesConstants.TENANT_ADMIN);
        return result;
    }

    /*自动更加当前角色获取对应的菜单*/
    public List<Menu> findAllByParam(){
        String param=SecurityUtils.getCurrentUserAuthority();
        return  menuRepository.findAllByParamContaining(param);
    }

    /*获取内置系统用户菜单*/
    public List<Menu> findAllByParamSystem(){
        return  menuRepository.findAllByParamContaining(AuthoritiesConstants.SYS_ADMIN);
    }

    /*获取企业级管理用户菜单*/
    public List<Menu> findAllByParamTenant(){
        return menuRepository.findAllByParamContaining(AuthoritiesConstants.TENANT_ADMIN);
    }


    /*获取当前所在角色  用户 的菜单*/
    public List<Menu>  findUserMenus(){
        List<Menu> list= new ArrayList<>();
        String login=SecurityUtils.getCurrentUserLogin();
        Optional<User> userOptional = userRepository.findOneByLogin(login).map(user -> {
            user.getRoles().size();
            user.getAuthorities().size();
            return  user;
        });
        Set<Authority> authorities = userOptional.get().getAuthorities();
        for (Authority authority:authorities){
             /*系统管理员*/
            if(authority.getName().equals(AuthoritiesConstants.SYS_ADMIN)){
                list=this.findAllByParamSystem();
//                list = menuRepository.findAll();
            }
             /*企业管理员*/
            if(authority.getName().equals(AuthoritiesConstants.TENANT_ADMIN)){
//                list = menuRepository.findAll();
                list=this.findAllByParamTenant();
            }
              /*企业用户*/
            if(authority.getName().equals(AuthoritiesConstants.TENANT_USER)){
                Set<RoleUser> roleUsers = userOptional.get().getRoles();
                List<Long> listRoleId= new ArrayList<>();
                for (RoleUser roleUser:roleUsers){
                    listRoleId.add(roleUser.getRole().getId());
                }
                List<RoleMenu> roleMenus =  roleMenuRepository.findAllByRoleIdIn(listRoleId.toArray(new Long[]{}));
                for (RoleMenu roleMenu:roleMenus){
                    if(!list.contains(roleMenu.getMenu())){
                        list.add(roleMenu.getMenu());
                    }
                }
            }
              /*匿名用户*/
            if(authority.getName().equals(AuthoritiesConstants.ANONYMOUS)){
                list = menuRepository.findAll();
            }
        }
        return list;
    }

    /*获取当前所在角色 用户的菜单 动作点*/
    public List<MenuAction>  findUserActionsByMenuName(String menulink){
        List<MenuAction> list = new ArrayList<>();
        String login=SecurityUtils.getCurrentUserLogin();
        Optional<User> userOptional = userRepository.findOneByLogin(login).map(user -> {
            user.getRoles().size();
            user.getAuthorities().size();
            return  user;
        });
        Set<Authority> authorities = userOptional.get().getAuthorities();
        for (Authority authority:authorities){
             /*系统管理员*/
            if(authority.getName().equals(AuthoritiesConstants.SYS_ADMIN)){
                Menu menu =  menuRepository.findOneByPath(menulink);
                list = menuActionRepository.findAllByMenuId(menu.getId());
            }
             /*企业管理员*/
            if(authority.getName().equals(AuthoritiesConstants.TENANT_ADMIN)){
                Menu menu =  menuRepository.findOneByPath(menulink);
                list = menuActionRepository.findAllByMenuId(menu.getId());
            }
              /*企业用户*/
            if(authority.getName().equals(AuthoritiesConstants.TENANT_USER)){
                Set<RoleUser> roleUsers = userOptional.get().getRoles();
                List<Long> listRoleId= new ArrayList<>();
                for (RoleUser roleUser:roleUsers){
                    listRoleId.add(roleUser.getRole().getId());
                }
                Menu menu =  menuRepository.findOneByPath(menulink);
                List<RoleMenu> roleMenus =  roleMenuRepository.findByMenuIdAndRoleIdIn(menu.getId(), listRoleId.toArray(new Long[]{}));
                for (RoleMenu roleMenu:roleMenus){
                    roleMenu.getActions().size();
                    Set<RoleMenuAction> roleMenuActions= roleMenu.getActions();
                    for (RoleMenuAction roleMenuAction: roleMenuActions){
                        if(!list.contains(roleMenuAction.getMenuAction())){
                            list.add(roleMenuAction.getMenuAction());
                        }
                    }
                }
            }
              /*匿名用户*/
            if(authority.getName().equals(AuthoritiesConstants.ANONYMOUS)){
                Menu menu =  menuRepository.findOneByPath(menulink);
                list = menuActionRepository.findAllByMenuId(menu.getId());
            }
        }
        return  list;
    }
}
