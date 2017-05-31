package cdhl.springboot_activiti.domain.erm;


import cdhl.springboot_activiti.domain.BaseEntity;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by Administrator on 2016/12/7.
 */
@Entity
@Table(name = "t_erm_role")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Role extends BaseEntity {

    /*角色名称*/
    @Column(name = "name")
    private String name;
    /*描述*/
    @Column(name = "describe")
    private String describe;


    /*角色 包含的用户*/
    @OneToMany(mappedBy = "role",cascade= CascadeType.ALL,fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<RoleUser> users= new HashSet<RoleUser>();

    /*角色 包含的菜单*/
    @OneToMany(mappedBy = "role",cascade= CascadeType.ALL,fetch = FetchType.LAZY)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<RoleMenu> menus= new HashSet<RoleMenu>();


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescribe() {
        return describe;
    }

    public void setDescribe(String describe) {
        this.describe = describe;
    }

    public Set<RoleUser> getUsers() {
        return users;
    }

    public void setUsers(Set<RoleUser> users) {
        this.users = users;
    }

    public Set<RoleMenu> getMenus() {
        return menus;
    }

    public void setMenus(Set<RoleMenu> menus) {
        this.menus = menus;
    }
}
