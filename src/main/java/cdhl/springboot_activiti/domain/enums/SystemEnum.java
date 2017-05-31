package cdhl.springboot_activiti.domain.enums;

import cdhl.springboot_activiti.config.annotation.Description;
import cdhl.springboot_activiti.domain.AbstractEntity;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

/**
 * Created by Administrator on 2016/12/23.
 */
@Entity
@Table(name = "t_system_enum")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@Description(Name = "系统枚举")
public  class SystemEnum  extends AbstractEntity {



    /*类型名称*/

    @Column(name = "type")
    private String type;


    /*父级名称*/
    @Column(name = "parent")
    private String parent;

    /*菜单名称*/
    @Column(name = "text")
    private String text;

    /*菜单名称*/
    @Column(name = "value")
    private String value;



    /*参数*/
    @Column(name = "param")
    private String param;




    public SystemEnum(){

    }



    public String getParent() {
        return parent;
    }

    public void setParent(String parent) {
        this.parent = parent;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getParam() {
        return param;
    }

    public void setParam(String param) {
        this.param = param;
    }
}
