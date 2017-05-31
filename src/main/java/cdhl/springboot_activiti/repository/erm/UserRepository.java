package cdhl.springboot_activiti.repository.erm;

import cdhl.springboot_activiti.domain.erm.User;

import java.time.ZonedDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(ZonedDateTime dateTime);

    Optional<User> findOneByResetKey(String resetKey);

    Optional<User> findOneByEmail(String email);

    Optional<User> findOneByLogin(String login);

    Optional<User> findOneById(Long userId);
    Page<User> findAllByOrganizationIdIn(Pageable pageable,Long[] orgzIds);
    List<User> findByOrganizationIdIn(Long[] orgzIds);
    @Query(value = "select distinct user from User user left join fetch user.authorities",
        countQuery = "select count(user) from User user")
    Page<User> findAllWithAuthorities(Pageable pageable);

    @Override
    void delete(User t);

   User findById(Long id);

    List<User> findByNameLike(String searchName);

    Page<User> findAllByOrganizationIdInAndNameLike(Pageable pageable, Long[] longArr, String s);

    Page<User> findAllByNameLike(Pageable pageable, String s);

    List<User> findAllByOrganizationId(Long id);
}
