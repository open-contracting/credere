import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# The reasons for this configuration were not documented in 427ce63. Assume server and certificate instability.
client = requests.Session()
client.mount("https://", HTTPAdapter(max_retries=Retry(3)))
client.mount("http://", HTTPAdapter(max_retries=Retry(3)))
client.verify = False


def make_request_with_retry(url: str, headers: dict[str, str]) -> requests.Response:
    """
    Make an HTTP request with retry functionality.

    :param url: The URL to make the request to.
    :param headers: The headers to include in the request.
    :return: The HTTP response from the request if successful, otherwise None.
    """
    response = client.get(url, headers=headers, timeout=60)
    response.raise_for_status()
    return response
