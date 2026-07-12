package revi1337.todo.common.timing;

import net.ttddyy.dsproxy.listener.MethodExecutionContext;
import net.ttddyy.dsproxy.listener.MethodExecutionListener;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Set;

public class ConnectionLifecycleTimingListener implements MethodExecutionListener {

    private static final Set<String> TX_CONTROL_METHODS = Set.of("commit", "rollback");

    @Override
    public void beforeMethod(MethodExecutionContext executionContext) {
    }

    @Override
    public void afterMethod(MethodExecutionContext executionContext) {
        String methodName = executionContext.getMethod().getName();
        Object target = executionContext.getTarget();

        boolean isConnectionAcquire = "getConnection".equals(methodName) && target instanceof DataSource;
        boolean isTxControl = TX_CONTROL_METHODS.contains(methodName);
        boolean isConnectionClose = "close".equals(methodName) && target instanceof Connection;

        if (isConnectionAcquire || isTxControl || isConnectionClose) {
            QueryTimingHolder.add(executionContext.getElapsedTime());
        }
    }
}
