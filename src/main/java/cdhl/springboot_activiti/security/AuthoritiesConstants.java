package cdhl.springboot_activiti.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String SYS_ADMIN = "ROLE_SYS_ADMIN";

    public static final String TENANT_ADMIN = "ROLE_TENANT_ADMIN";

    public static final String TENANT_USER = "ROLE_TENANT_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    private AuthoritiesConstants() {

    }
}
