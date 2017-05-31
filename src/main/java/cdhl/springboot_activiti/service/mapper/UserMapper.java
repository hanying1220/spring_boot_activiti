package cdhl.springboot_activiti.service.mapper;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import cdhl.springboot_activiti.domain.erm.Authority;
import cdhl.springboot_activiti.domain.erm.User;
import cdhl.springboot_activiti.service.dto.UserDTO;

/**
 * Mapper for the entity User and its DTO UserDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface UserMapper {

    UserDTO userToUserDTO(User user);

    List<UserDTO> usersToUserDTOs(List<User> users);
    @Mappings({
    @Mapping(target = "createdBy", ignore = true),
    @Mapping(target = "createdDate", ignore = true),
    @Mapping(target = "lastModifiedBy", ignore = true),
    @Mapping(target = "lastModifiedDate", ignore = true),
    @Mapping(target = "persistentTokens", ignore = true),
    @Mapping(target = "id", ignore = true),
    @Mapping(target = "activationKey", ignore = true),
    @Mapping(target = "resetKey", ignore = true),
    @Mapping(target = "resetDate", ignore = true),
    @Mapping(target = "password", ignore = true),
    @Mapping(target = "userUrl", ignore = true),
    @Mapping(target = "roles", ignore = true),
    @Mapping(target = "name", ignore = true),
    @Mapping(target = "gender", ignore = true),
    @Mapping(target = "imageUrl", ignore = true),
    @Mapping(target = "phone", ignore = true),
    @Mapping(target = "telePhone", ignore = true),
    @Mapping(target = "idCard", ignore = true),
    @Mapping(target = "birthday", ignore = true),
    @Mapping(target = "qqNum", ignore = true),
    @Mapping(target = "organization", ignore = true),
    @Mapping(target = "code", ignore = true)
    })
    User userDTOToUser(UserDTO userDTO);

    List<User> userDTOsToUsers(List<UserDTO> userDTOs);

    default User userFromId(Long id) {
        if (id == null) {
            return null;
        }
        User user = new User();
        user.setId(id);
        return user;
    }

    default Set<String> stringsFromAuthorities (Set<Authority> authorities) {
        return authorities.stream().map(Authority::getName)
            .collect(Collectors.toSet());
    }

    default Set<Authority> authoritiesFromStrings(Set<String> strings) {
        return strings.stream().map(string -> {
            Authority auth = new Authority();
            auth.setName(string);
            return auth;
        }).collect(Collectors.toSet());
    }
}
