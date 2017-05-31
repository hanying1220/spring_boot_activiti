package cdhl.springboot_activiti.repository.erm;

import cdhl.springboot_activiti.domain.erm.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Created by Administrator on 2016/12/8.
 */
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    List<Organization> findAllByParentId(Long id);

    @Modifying
    @Query("update Organization a set a.isParent =true  where a.id = ?1")
    void update(Long id);

    @Modifying
    @Query("update Organization a set a.name = ?1  where a.id = ?2")
    void updateOrgz(String name,Long id);


    @Modifying
    @Query("update Organization a set a.isParent=0 where id =?1 and (SELECT count(*) FROM Organization a where parentId=?1)=0")
    int updateIsParentId(Long pid);

    @Query(value = "WITH w1( id, parent_Id, name) AS " +
        "(       SELECT " +
        "            orz .id, " +
        "            orz .parent_Id, " +
        "            orz .name " +
        "        FROM " +
        "            T_ERM_ORGANIZATION  orz " +
        "        WHERE " +
        "            id = ?1" +
        "    UNION ALL " +
        "        SELECT " +
        "            orz  .id,  " +
        "            orz  .parent_Id,  " +
        "            orz  .name " +
        "        FROM " +
        "            T_ERM_ORGANIZATION  orz  JOIN w1 ON orz .parent_Id= w1.id " +
        ")  " +
        "SELECT id FROM w1",nativeQuery=true)
    Long[] findIdByParentId(Long id);
}
