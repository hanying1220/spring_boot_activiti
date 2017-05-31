package cdhl.springboot_activiti.repository.erm;


import cdhl.springboot_activiti.domain.erm.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Created by Administrator on 2016/12/8.
 */
public interface RoleRepository  extends JpaRepository<Role, Long> {

    List<Role> findAllByName(String name);

   // @Query(value="select * from t_erm_role a where a.name like CONCAT('%',:keyName,'%') and tenancy_code is not null",nativeQuery=true)
    List<Role> findByNameLike(String keyName);

    List<Role> findByIdIn(Long[] roleIds);

    List<Role> findByIdNotIn(Long[] roleIds);
}
