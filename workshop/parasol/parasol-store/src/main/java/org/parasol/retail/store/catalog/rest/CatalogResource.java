package org.parasol.retail.store.catalog.rest;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;

@Path("/catalog")
public class CatalogResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Map<String, String>> listProducts() {
        return List.of(
                Map.of("sku", "parasol-001", "name", "Beach umbrella"),
                Map.of("sku", "parasol-002", "name", "Sun hat"));
    }

    /* DELETE THIS COMMENT LINE
    @GET
    @Path("/count")
    @Produces(MediaType.APPLICATION_JSON)
    public Map<String, Integer> getProductCount() {
        return Map.of("count", 2);
    }
    DELETE THIS COMMENT LINE */
}
