package com.jhipsterpress.web.repository.search;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;

/**
 * Configure a Mock version of CmessageSearchRepository to test the
 * application without starting Elasticsearch.
 */
@Configuration
public class CmessageSearchRepositoryMockConfiguration {

    @MockBean
    private CmessageSearchRepository mockCmessageSearchRepository;

}
