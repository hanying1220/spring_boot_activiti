package cdhl.springboot_activiti.service.dto;

import cdhl.springboot_activiti.config.Constants;

import cdhl.springboot_activiti.domain.erm.Authority;
import cdhl.springboot_activiti.domain.erm.User;

import org.hibernate.validator.constraints.Email;

import javax.validation.constraints.*;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A DTO representing a user, with his authorities.
 */
public class UserDTO {

    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = 50)
    private String login;

    private String name;

    @Email
    @Size(min = 5, max = 100)
    private String email;

    private boolean activated = false;

    @Size(min = 2, max = 5)
    private String langKey;

    private String tenancyCode;

    private String orgName;


    private Set<String> authorities;

    public UserDTO() {
    }

    public UserDTO(User user) {
        this(user.getLogin(),user.getName(),
            user.getEmail(), user.getActivated(), user.getLangKey(),user.getTenancyCode(),
            user.getAuthorities().stream().map(Authority::getName)
                .collect(Collectors.toSet()));
    }

    public UserDTO(String login,String name,
        String email, boolean activated, String langKey,String tenancyCode, Set<String> authorities) {
        this.login = login;
        this.name=name;
        this.email = email;
        this.activated = activated;
        this.langKey = langKey;
        this.tenancyCode = tenancyCode;
        this.authorities = authorities;
    }

    public String getLogin() {
        return login;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getEmail() {
        return email;
    }

    public boolean isActivated() {
        return activated;
    }

    public String getLangKey() {
        return langKey;
    }

    public String getTenancyCode() {
        return tenancyCode;
    }

    public Set<String> getAuthorities() {
        return authorities;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
            "login='" + login + '\'' +
            ", name='" + name + '\'' +
            ", email='" + email + '\'' +
            ", activated=" + activated +
            ", langKey='" + langKey + '\'' +
            ", tenancyCode='" + tenancyCode + '\'' +
            ", authorities=" + authorities +
            "}";
    }


}
