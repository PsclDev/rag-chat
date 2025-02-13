# Services Documentation

## Unstructured API Service

The Unstructured API service is used for processing and extracting structured information from unstructured documents.

### Configuration

- **Port**: 5001 (mapped to container port 8000)
- **Image**: downloads.unstructured.io/unstructured-io/unstructured-api:0.0.80
- **Restart Policy**: Always

### Environment Variables

- `UNSTRUCTURED_API_KEY`: API key for authentication (required)
  - Current value: `MySuperSecretUnstructuredApiKey`
  - Note: In production, this should be replaced with a secure API key

### Usage

The service will be available at `http://localhost:5001` once the container is running.

To start the service:

```bash
docker-compose up -d
``` 