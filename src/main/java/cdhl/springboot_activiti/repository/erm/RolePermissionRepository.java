package cdhl.springboot_activiti.repository.erm;


import cdhl.springboot_activiti.domain.erm.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;

/**
 * Created by Administrator on 2016/12/8.
 */
public interface RolePermissionRepository  extends JpaRepository<RolePermission, Long> {

    @Modifying
    @Transactional
    @Query(value = "delete from t_erm_role_permission where id=?1",nativeQuery=true)
    void deleteById(Long id);
}
