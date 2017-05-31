package cdhl.springboot_activiti.config;

import cdhl.springboot_activiti.aop.tenant.TenantAspect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;


@Configuration
@EnableAspectJAutoProxy
public class TenantAspectConfiguration {

    @Bean
    public TenantAspect tenantAspect(){
        return new TenantAspect();
    }
}
