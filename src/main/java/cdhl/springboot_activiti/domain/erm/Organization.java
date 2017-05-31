package cdhl.springboot_activiti.domain.erm;

import cdhl.springboot_activiti.domain.BaseEntity;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;

/**
 * Created by Administrator on 2016/12/7.
 */
@Entity
@Table(name = "t_erm_organization")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Organization extends BaseEntity {


    /*编码*/
    @Column(name = "code")
    private String code;
    /*名称*/
    @Column(name = "name")
    private String name;

    /*图标*/
    @Column(name = "cls")
    private String cls;

    /*全称*/
    @Column(name = "fullName")
    private String fullName;


    /*机构类型*/
    @Column(name = "orgzType")
    private Integer orgzType;   // 1:公司 2:部门

    /*是否为父节点*/
    @Column(name = "isParent")
    private boolean isParent;


    /*组织机构路径*/
    @Column(name = "orgzUrl")
    private String orgzUrl;
    public Organization() {
        // do nothing
    }

    public Integer getOrgzType() {
        return orgzType;
    }

    public void setOrgzType(Integer orgzType) {
        this.orgzType = orgzType;
    }

    public String getOrgzUrl() {
        return orgzUrl;
    }

    public void setOrgzUrl(String orgzUrl) {
        this.orgzUrl = orgzUrl;
    }

    /*上级id*/
    @Column(name="parent_id")
    private Long parentId;

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public boolean getIsParent() {
        return isParent;
    }

    public void setIsParent(boolean isParent) {
        this.isParent = isParent;
    }

    public String getCls() {
        return cls;
    }

    public void setCls(String cls) {
        this.cls = cls;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
