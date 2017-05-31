package cdhl.springboot_activiti.aop.tenant;

import cdhl.springboot_activiti.security.SecurityUtils;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

/**
 * Created by pc on 2016-12-29.
 */
@Aspect
public class TenantAspect {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @PersistenceContext
    private EntityManager entityManager;

    @Pointcut("execution(* cdhl.springboot_activiti.service..ItenantService+.find*(..))")
    public void tenantPointcut(){}

    @Before("tenantPointcut()")
    public void before(){
        Filter filter = (Filter)entityManager.unwrap(Session.class).enableFilter("tenantCodeFilter");
        String tenantCode = SecurityUtils.getCurrentUserTenant();
        filter.setParameter("tenantCode",tenantCode);
    }

    @After("tenantPointcut()")
    public void after(){
        entityManager.unwrap(Session.class).disableFilter("tenantCodeFilter");
    }
}
