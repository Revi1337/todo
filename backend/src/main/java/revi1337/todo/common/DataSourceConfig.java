package revi1337.todo.common;

import net.ttddyy.dsproxy.support.ProxyDataSourceBuilder;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import revi1337.todo.common.timing.ConnectionLifecycleTimingListener;
import revi1337.todo.common.timing.QueryTimingListener;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        DataSource actual = properties.initializeDataSourceBuilder().build();
        return ProxyDataSourceBuilder
                .create(actual)
                .listener(new QueryTimingListener())
                .methodListener(new ConnectionLifecycleTimingListener())
                .build();
    }
}
