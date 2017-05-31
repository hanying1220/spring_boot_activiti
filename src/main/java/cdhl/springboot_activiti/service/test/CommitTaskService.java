package cdhl.springboot_activiti.service.test;

import cdhl.springboot_activiti.domain.erm.Role;
import org.activiti.engine.delegate.DelegateTask;
import org.activiti.engine.delegate.TaskListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by Administrator on 2016/12/8.
 */
@Service("commitTaskService")
@Transactional
public class CommitTaskService implements TaskListener {

    private final Logger log = LoggerFactory.getLogger(Role.class);


    @Override
    public void notify(DelegateTask delegateTask) {
        String etname=delegateTask.getEventName();
        String id=delegateTask.getId();
        String name=delegateTask.getName();
        String assign=delegateTask.getAssignee();

        System.out.println(String.format("----------CommitTaskService:eventName=%s,id=%s,name=%s,assign=%s--------",etname,id,name,assign));

    }
}
