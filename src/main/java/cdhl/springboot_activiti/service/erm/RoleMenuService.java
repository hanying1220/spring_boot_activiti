package cdhl.springboot_activiti.service.erm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cdhl.springboot_activiti.domain.erm.RoleMenu;
import cdhl.springboot_activiti.repository.erm.RoleMenuRepository;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service
@Transactional
public class RoleMenuService {

    private final Logger log = LoggerFactory.getLogger(RoleMenu.class);

    @Autowired
    private RoleMenuRepository roleMenuRepository;
}
