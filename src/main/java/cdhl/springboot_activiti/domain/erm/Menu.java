package cdhl.springboot_activiti.domain.erm;


import cdhl.springboot_activiti.domain.AbstractEntity;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by Administrator on 2016/12/7.
 */
@Entity
@Table(name = "t_erm_menu")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Menu  extends AbstractEntity {

    /*菜单编号*/
    @Column(name = "code")
    private String code;

    /*菜单名称*/
    @Column(name = "name")
    private String name;

    /*菜单图标*/
    @Column(name = "icon")
    private String icon;

    /*菜单url*/
    @Column(name = "path")
    private String path;

    /*菜单类型（ group  菜单组  item 菜单项）*/
    @Column(name = "type")
    private String type;


    /*上级菜单*/
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="parent_id")
    private Menu parent;


    /*角色 包含的菜单*/
    @OneToMany(mappedBy = "menu",cascade = CascadeType.ALL,orphanRemoval = true,fetch=FetchType.EAGER)
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<MenuAction> actions= new HashSet<MenuAction>();

    /*参数*/
    private String param;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<MenuAction> getActions() {
        return actions;
    }

    public void setActions(Set<MenuAction> actions) {
        this.actions = actions;
    }


    public Menu getParent() {
        return parent;
    }

    public void setParent(Menu parent) {
        this.parent = parent;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getParam() {
        return param;
    }

    public void setParam(String param) {
        this.param = param;
    }

    public Menu() {


    }
}
