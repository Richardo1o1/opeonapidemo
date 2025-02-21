import type { AppOpenAPI } from "@/utility/types";
import packageJSON from "@/package.json" with { type: "json" };

export default function configureOpenAPI(app : AppOpenAPI){
    app.doc("/doc", {
        openapi: "3.0.0",
        info: {
            version: packageJSON.version,
            title: "OpenAPI Demo API",
        },
    });
}