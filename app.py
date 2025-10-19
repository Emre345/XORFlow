from flask import Flask, render_template, request, jsonify
import base64

# Flask uygulamasını başlat
app = Flask(__name__)

def xor_cipher_process(data, key):
    """
    Verilen anahtar ile bayt verileri üzerinde XOR işlemi gerçekleştirir.
    Anahtar, veri uzunluğuna uyacak şekilde tekrarlanır.
    """
    key_bytes = key.encode('utf-8')
    data_bytes = bytearray(data)
    key_len = len(key_bytes)
    
    # Her bir baytı anahtarın ilgili baytı ile XOR'la
    return bytes([b ^ key_bytes[i % key_len] for i, b in enumerate(data_bytes)])

@app.route('/')
def index():
    """Ana sayfayı render eder."""
    return render_template('index.html')

@app.route('/cipher', methods=['POST'])
def cipher():
    """Şifreleme ve şifre çözme isteklerini yönetir."""
    try:
        data = request.json
        text = data.get('text')
        key = data.get('key')
        mode = data.get('mode')  # 'encrypt' veya 'decrypt'

        if not text or not key:
            return jsonify({'error': 'Metin ve anahtar boş olamaz.'}), 400

        if mode == 'encrypt':
            # Düz metni şifrele
            text_bytes = text.encode('utf-8')
            encrypted_bytes = xor_cipher_process(text_bytes, key)
            # Sonucu güvenli bir şekilde göndermek için Base64 formatına çevir
            encrypted_text = base64.b64encode(encrypted_bytes).decode('utf-8')
            return jsonify({'result': encrypted_text})
        
        elif mode == 'decrypt':
            # Base64 formatındaki şifreli metni çöz
            try:
                ciphertext_bytes = base64.b64decode(text)
            except (base64.binascii.Error, TypeError):
                 return jsonify({'error': 'Geçersiz Base64 formatı. Lütfen şifrelenmiş metni doğru girin.'}), 400
            
            # Baytları deşifrele
            decrypted_bytes = xor_cipher_process(ciphertext_bytes, key)
            
            # Sonucu tekrar okunabilir metne çevir
            try:
                decrypted_text = decrypted_bytes.decode('utf-8')
                return jsonify({'result': decrypted_text})
            except UnicodeDecodeError:
                return jsonify({'error': 'Şifre çözülemedi. Anahtar veya şifreli metin yanlış olabilir.'}), 400
        
        else:
            return jsonify({'error': 'Geçersiz işlem modu.'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
