package cdhl.springboot_activiti.service.test;

import cdhl.springboot_activiti.domain.erm.Role;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service("archiveTaskService")
@Transactional
public class ArchiveTaskService implements JavaDelegate {

    private final Logger log = LoggerFactory.getLogger(Role.class);

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String name=execution.getEventName();
        System.out.println("--------------执行归档操作:\t"+name+"------------------");

    }

}
