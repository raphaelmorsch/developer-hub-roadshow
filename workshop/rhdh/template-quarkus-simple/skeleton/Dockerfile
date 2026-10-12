FROM registry.access.redhat.com/ubi9/openjdk-17:1.21 AS build
WORKDIR /work
COPY . .
USER 0
RUN microdnf install -y maven && microdnf clean all && chown -R 185:0 /work
USER 185
RUN mvn -DskipTests package

FROM registry.access.redhat.com/ubi9/openjdk-17-runtime:1.21
COPY --from=build /work/target/quarkus-app /work
WORKDIR /work
EXPOSE 8080
CMD ["java", "-jar", "quarkus-run.jar"]
