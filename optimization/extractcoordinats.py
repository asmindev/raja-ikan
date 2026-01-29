import requests
import re
from urllib.parse import unquote

def extract_lat_lng_from_url(url):
    # Prioritas 1: Format data parameter (!3d dan !4d) - Lokasi pin/tujuan (lebih akurat daripada viewport)
    match_data = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', url)
    if match_data:
        return match_data.group(1), match_data.group(2)

    # Pola regex untuk berbagai format URL Google Maps
    # 1. Format standar: @-6.200000,106.800000
    match_at = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
    if match_at:
        return match_at.group(1), match_at.group(2)

    # 2. Format pencarian: /search/lat,lng/ atau /place/lat,lng/
    match_path = re.search(r'/(?:search|place)/[^/]+/(-?\d+\.\d+),(-?\d+\.\d+)', url)
    if match_path:
        return match_path.group(1), match_path.group(2)

    # 3. Format query parameter: ?q=lat,lng atau &ll=lat,lng
    match_query = re.search(r'[?&](?:q|ll|sll)=(-?\d+\.\d+),(-?\d+\.\d+)', url)
    if match_query:
        return match_query.group(1), match_query.group(2)

    return None, None

def process_maps_links(links):
    print(f"{'LINK AWAL':<40} | {'STATUS':<10} | {'KOORDINAT (Lat, Lng)'}")
    print("-" * 80)

    session = requests.Session()
    # Menggunakan User-Agent agar tidak dianggap bot
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })

    for link in links:
        try:
            # allow_redirects=True akan mengikuti sampai URL terakhir
            response = session.get(link, allow_redirects=True, timeout=10)
            final_url = response.url

            if response.status_code == 200:
                lat, lng = extract_lat_lng_from_url(final_url)
                if lat and lng:
                    print(f"{lat}, {lng}")
                else:
                    # Coba decode URL jika ada karakter tersembunyi
                    decoded_url = unquote(final_url)
                    lat, lng = extract_lat_lng_from_url(decoded_url)
                    if lat and lng:
                         print(f"{link:<40} | OK         | {lat}, {lng}")
                    else:
                         print(f"{link:<40} | Gagal Estrak | (URL Akhir: {final_url[:30]}...)")
            else:
                print(f"{link:<40} | Error {response.status_code} | -")

        except requests.exceptions.RequestException as e:
            print(f"{link:<40} | Koneksi Gagal | {str(e)[:20]}...")

# Daftar URL kamu
urls = [
    "https://maps.app.goo.gl/jJShJgHppokYKZ269",
"https://maps.app.goo.gl/PToKp475XiBtEdFH8",
"https://maps.app.goo.gl/yK3aQwcVhoz1gsP89",
"https://maps.app.goo.gl/UB1fiPEqM1mmVRiR6",
"https://maps.app.goo.gl/8XFfwMX9phqhSXAB7",
"https://maps.app.goo.gl/mHP57wAcf5HDocSa7",
"https://maps.app.goo.gl/jJShJgHppokYKZ269",
"https://maps.app.goo.gl/JeXwUJHxvD5mQfsq6",
"https://maps.app.goo.gl/WxkZ7cWZDUwuSSet8",
"https://maps.app.goo.gl/AonS6JM2GpUSHREf7",
"https://maps.app.goo.gl/dUvvaY2KiVpQpseSA",
"https://maps.app.goo.gl/sAHkjGazX9eAntLJ9",
"https://maps.app.goo.gl/dJYizcx9PAQn3cHy8",
"https://maps.app.goo.gl/RurYzBmovbzr3EMP9",
"https://maps.app.goo.gl/b3oaVgod2YdM4FFe9",
"https://maps.app.goo.gl/YjTiDrtQ1z2EikiP7",
"https://maps.app.goo.gl/TpaQtUUsqzswF2ne7",
"https://maps.app.goo.gl/ZSRg2cmKDLL4Zvxz6",
"https://maps.app.goo.gl/StVk4iYr8NyzQ8D87",
]

process_maps_links(urls)
