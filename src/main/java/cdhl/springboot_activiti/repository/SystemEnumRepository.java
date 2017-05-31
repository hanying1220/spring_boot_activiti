package cdhl.springboot_activiti.repository;

import cdhl.springboot_activiti.domain.enums.SystemEnum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Created by Administrator on 2016/12/23.
 */
public interface SystemEnumRepository extends JpaRepository<SystemEnum, String> {


    List<SystemEnum>  findAllByType(String type);

    SystemEnum findOneByParentAndValue(String parent,String value);

    List<SystemEnum>  findAllByParent(String parent);

    List<SystemEnum>  findAllByParentAndParam(String parent,String param);

     void  deleteById(Long id);
}
