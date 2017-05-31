package cdhl.springboot_activiti.domain.erm;


import com.fasterxml.jackson.annotation.JsonIgnore;
import cdhl.springboot_activiti.domain.AbstractEntity;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

/**
 * Created by Administrator on 2016/12/7.
 */
@Entity
@Table(name = "t_erm_menu_action")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class MenuAction extends AbstractEntity {

    /*操作符*/
    @Column(name = "value")
    private String value;
    /*名称*/
    @Column(name = "text")
    private String text;

    /*所属菜单*/
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="menu_id")
    @JsonIgnore
    private Menu menu;

    /*菜单图标*/
    @Column(name = "icon")
    private String icon;

    public Menu getMenu() {
        return menu;
    }

    public void setMenu(Menu menu) {
        this.menu = menu;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }


}
