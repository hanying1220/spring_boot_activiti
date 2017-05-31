package cdhl.springboot_activiti.repository.erm;

import cdhl.springboot_activiti.domain.erm.MenuAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Created by Administrator on 2016/12/8.
 */
public interface MenuActionRepository  extends JpaRepository<MenuAction, Long> {

    List<MenuAction> findAllByMenuId(Long menuId);

//    @Query("select distinct action from t_erm_menu_action  action where id in(select action_id from t_erm_role_menu_action  where  role_menu_id in (select id from t_erm_role_menu where role_id=?0 and menu_id=?1 ))")
//    List<MenuAction> findAllUserAction(Long roleId,  Long menuId);

     List<MenuAction> findByIdIn(Long[] ids);
}
