# Unstructured

## Partitioning

Unstructured's partitioning functions extract structured content from raw documents by breaking them down into elements like Title, NarrativeText, and ListItem. The library provides a main partition function that automatically detects file types using libmagic (or falls back to file extensions) and routes documents to the appropriate partitioning function. Users can also directly call specific partitioning functions if they know their document type.