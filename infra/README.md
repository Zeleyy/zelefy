## Хранилище (S3 / Garage)

Первичная инициализация выполняется **один раз** после старта контейнеров (`docker compose up -d`):

1. **Инициализация узла**

    ```shell
    docker compose exec s3_storage /garage status
    ```

2. **Назначаем емкость**

    ```shell
    docker compose exec s3_storage /garage layout assign <NODE_ID> --capacity 20G --zone dc1
    ```

3. **Применяем конфигурацию кластера**

    ```shell
    docker compose exec s3_storage /garage layout apply --version 1
    ```

4. Создание S3-ключей доступа

    ```shell
    docker compose exec s3_storage /garage key create app-key
    ```

5. Создание бакетов и выдача прав

    ```shell
    # Создание бакетов
    docker compose exec s3_storage /garage bucket create profiles-avatars

    # Привязка прав (RW) к API-ключу
    docker compose exec s3_storage /garage bucket allow profiles-avatars --key app-key --read --write
    ```
