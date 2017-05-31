package cdhl.springboot_activiti.service.erm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.MenuAction;
import cdhl.springboot_activiti.repository.erm.MenuActionRepository;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service
@Transactional
public class MenuActionService   {

    private final Logger log = LoggerFactory.getLogger(MenuAction.class);

    @Autowired
    private MenuActionRepository menuActionRepository;

    public MenuAction findOne(Long id){
        return menuActionRepository.findOne(id);
    }

}
