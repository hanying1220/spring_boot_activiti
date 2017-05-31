package cdhl.springboot_activiti.domain.erm;


import com.fasterxml.jackson.annotation.JsonIgnore;
import cdhl.springboot_activiti.domain.BaseEntity;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

/**
 * Created by Administrator on 2016/12/7.
 */
@Entity
@Table(name = "t_erm_role_menu_action")
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class RoleMenuAction  extends BaseEntity {

    /* 角色对应菜单权限 的功能点 */
    @ManyToOne(fetch= FetchType.EAGER)
    @JoinColumn(name="roleMenu_id")
    @JsonIgnore
    private RoleMenu roleMenu;


    /* 角色对应菜单权限 的功能点 */
    @ManyToOne(fetch= FetchType.EAGER)
    @JoinColumn(name="action_id")
    @JsonIgnore
    private MenuAction menuAction;


    public MenuAction getMenuAction() {
        return menuAction;
    }

    public void setMenuAction(MenuAction menuAction) {
        this.menuAction = menuAction;
    }

    public RoleMenu getRoleMenu() {
        return roleMenu;
    }

    public void setRoleMenu(RoleMenu roleMenu) {
        this.roleMenu = roleMenu;
    }
}
