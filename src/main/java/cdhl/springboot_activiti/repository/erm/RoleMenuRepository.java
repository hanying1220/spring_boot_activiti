package cdhl.springboot_activiti.repository.erm;

import cdhl.springboot_activiti.domain.erm.RoleMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Created by Administrator on 2016/12/8.
 */
public interface RoleMenuRepository   extends JpaRepository<RoleMenu, Long> {

    List<RoleMenu> findAllByRoleId(Long roleId);

    List<RoleMenu> findAllByRoleIdIn(Long[] roleIds);

    RoleMenu findOneByRoleIdAndMenuId(Long roleId,Long menuId);

    List<RoleMenu> findByMenuIdAndRoleIdIn(Long menuId,Long[] roleIds);

}
