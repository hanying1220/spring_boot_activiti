package cdhl.springboot_activiti.repository.erm;

import cdhl.springboot_activiti.domain.erm.RoleUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Created by Administrator on 2016/12/8.
 */
public interface RoleUserRepository  extends JpaRepository<RoleUser, Long> {
    public List<RoleUser> findByRoleId(Long roleId);

    public List<RoleUser> findAllByUserIdAndRoleId(Long userId, Long roleId);

    public void  deleteById(Long id);

    @Query(value = "select R from RoleUser R where R.user.name like %?1% and R.role.id=?2")
    public List<RoleUser> findByNameLikeAndRoleId(String name,Long roleId);

    @Query(value = "select role_id from T_ERM_ROLE_USER where user_id=?1",nativeQuery=true)
    public Long[] findRoleIdByUserId(Long id);

    @Modifying
    @Query(value = "delete from  T_ERM_ROLE_USER where user_id=?1",nativeQuery=true)
    void deleteUserAllRole(Long id);
}
