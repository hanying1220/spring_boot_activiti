package cdhl.springboot_activiti.repository;

import cdhl.springboot_activiti.domain.erm.Authority;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the Authority entity.
 */
public interface AuthorityRepository extends JpaRepository<Authority, String> {
}
