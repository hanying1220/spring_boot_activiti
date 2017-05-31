package cdhl.springboot_activiti.domain.erm;


import com.fasterxml.jackson.annotation.JsonIgnore;
import cdhl.springboot_activiti.domain.BaseEntity;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

/**
 * 数据权限
 */
@Entity
@Table(name = "t_erm_role_permission")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class RolePermission extends BaseEntity {


    /* 角色对应菜单权限 的功能点 */
    @ManyToOne(fetch= FetchType.EAGER)
    @JoinColumn(name="roleMenu_id")
    @JsonIgnore
    private RoleMenu roleMenu;

    /*用户*/
    @ManyToOne(fetch= FetchType.EAGER)
    @JoinColumn(name="user_id")
    @JsonIgnore
    private User user;

    public RoleMenu getRoleMenu() {
        return roleMenu;
    }

    public void setRoleMenu(RoleMenu roleMenu) {
        this.roleMenu = roleMenu;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
