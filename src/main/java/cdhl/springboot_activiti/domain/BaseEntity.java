package cdhl.springboot_activiti.domain;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.Filters;
import org.hibernate.annotations.ParamDef;
import org.hibernate.envers.Audited;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.util.Objects;

/**
 * Created by Administrator on 2016/12/7.
 */
@MappedSuperclass
@Audited
@EntityListeners(AuditingEntityListener.class)
@FilterDef(name = "tenantCodeFilter", parameters = { @ParamDef(name = "tenantCode", type = "string") })
@Filters({ @Filter(name = "tenantCodeFilter", condition = ":tenantCode = tenancy_code") })
public abstract class BaseEntity extends AbstractAuditingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name="tenancy_code")
    private String tenancyCode;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getTenancyCode() {
        return tenancyCode;
    }

    public void setTenancyCode(String tenancyCode) {
        this.tenancyCode = tenancyCode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        BaseEntity entity = (BaseEntity) o;
        if(entity.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, entity.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }


}
