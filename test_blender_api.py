import pytest
from playwright.sync_api import Playwright, APIRequestContext

# Фикстура для создания контекста запросов (аналог вашей фикстуры page)
@pytest.fixture(scope="session")
def api_request_context(playwright: Playwright) -> APIRequestContext:
    request_context = playwright.request.new_context(
        base_url="https://extensions.blender.org"
    )
    yield request_context
    request_context.dispose()

#Тест 1 - Проверка, что API возвращает успешный статус
def test_get_extensions_list(api_request_context: APIRequestContext):
    response = api_request_context.get("/api/v1/extensions/")
    # Проверяем, что сервер ответил "200 OK"
    assert response.ok
    # Проверяем, что тело ответа не пустое
    data = response.json()
    assert isinstance(data, (list, dict))

#Тест 2 - Проверка фильтрации по версии Blender
def test_filter_by_blender_version(api_request_context: APIRequestContext):
    response = api_request_context.get("/api/v1/extensions/", params={"blender_version": "4.2.0"})
    assert response.ok
    # Здесь можно добавить логику проверки, что все возвращенные расширения совместимы с 4.2.0

#Тест 3 - Проверка поиска (если API его поддерживает)
def test_search_extensions(api_request_context: APIRequestContext):
    response = api_request_context.get("/api/v1/extensions/", params={"q": "usd"})
    assert response.ok
    #Можно проверить, что в результатах есть слово "usd"
