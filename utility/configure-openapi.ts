import type { AppOenAPI } from "@/utility/types";
import packageJSON from "@/package.json" with { type: "json" };

export default function configureOpenAPI(app : AppOenAPI){
    app.doc("/doc", {
        openapi: "3.0.0",
        info: {
            version: packageJSON.version,
            title: "Tasks API",
        },
    });
}