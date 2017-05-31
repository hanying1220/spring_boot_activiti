package cdhl.springboot_activiti.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;


/**
 * Created by hujy on 2016/10/26.
 */
public class UserTenant extends User {
    private static final long serialVersionUID = 1L;

    private String tenantCode;

    @SuppressWarnings("deprecation")
    public UserTenant(String username, String password, Collection<? extends GrantedAuthority> authorities) throws IllegalArgumentException {
            super(username,password, authorities);
    }


    public String getTenantCode() {
        return tenantCode;
    }

    public void setTenantCode(String tenantCode) {
        this.tenantCode = tenantCode;
    }
}
