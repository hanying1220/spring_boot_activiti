package cdhl.springboot_activiti.repository.erm;

import cdhl.springboot_activiti.domain.erm.Menu;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;

/**
 * Created by Administrator on 2016/12/8.
 */
public interface MenuRepository  extends JpaRepository<Menu, Long> {

    List<Menu> findAllByParentId(Long id,Sort sort);

    @Query(countQuery = "select count(menu) from Menu menu")
    Page<Menu> findAllByParentId(Pageable pageable,Long id);

    @Query("select m from Menu m where m.parent is not null order by m.parent")
    List<Menu> findAllMenuItems();

    @Query("select m from Menu m where m.parent is not null and m.param like %?1 order by m.parent")
    List<Menu> findAllItems(String param);

    Menu findOneByPath(String path);

    List<Menu> findAllByParam(String param);

    List<Menu> findAllByParamContaining(String param);

    List<Menu>   findAllByParentNotNullAndParamContaining(String param);
}
