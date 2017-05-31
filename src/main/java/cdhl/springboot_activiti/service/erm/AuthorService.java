package cdhl.springboot_activiti.service.erm;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.RoleMenu;
import cdhl.springboot_activiti.repository.erm.RoleMenuActionRepository;
import cdhl.springboot_activiti.repository.erm.RoleMenuRepository;
import cdhl.springboot_activiti.repository.erm.RolePermissionRepository;
import cdhl.springboot_activiti.service.ItenantService;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service
@Transactional
public class AuthorService implements ItenantService{

    private final Logger log = LoggerFactory.getLogger(AuthorService.class);

    @Autowired
    private RoleMenuRepository roleMenuRepository;
    @Autowired
    private RoleMenuActionRepository roleMenuActionRepository;
    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Transactional(readOnly = true)
    public List<RoleMenu> findAllRoleMenu(Long roleId) {
        log.debug("Request to get all RoleMenu");
        List<RoleMenu> list = roleMenuRepository.findAllByRoleId(roleId);
        return list;
    }

    @Transactional(readOnly = true)
    public RoleMenu findOneByRoleIdAndMenuId(Long roleId,Long menuId){
        RoleMenu roleMenu = roleMenuRepository.findOneByRoleIdAndMenuId(roleId, menuId);
        return roleMenu;
    }

}
