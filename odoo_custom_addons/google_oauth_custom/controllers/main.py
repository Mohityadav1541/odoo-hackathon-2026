import os
import json
import urllib.parse
import requests

from odoo import http, _
from odoo.http import request

# We read environment variables directly to avoid hardcoding secrets
# User should ensure these are set before starting Odoo, or loaded via python-dotenv
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8069/auth/google/callback')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

class GoogleOAuthController(http.Controller):

    @http.route('/auth/google', type='http', auth='public', csrf=False)
    def auth_google(self, **kw):
        """ Redirects the user to the Google OAuth consent screen. """
        if not GOOGLE_CLIENT_ID:
            return request.make_response("Google Client ID is not configured.", status=500)
            
        params = {
            'client_id': GOOGLE_CLIENT_ID,
            'redirect_uri': GOOGLE_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        return request.redirect(auth_url)

    @http.route('/auth/google/callback', type='http', auth='public', csrf=False)
    def auth_google_callback(self, **kw):
        """ Handles the OAuth callback from Google. """
        code = kw.get('code')
        error = kw.get('error')
        
        if error:
            return request.redirect(f"{FRONTEND_URL}/auth/signin?error={error}")
            
        if not code:
            return request.redirect(f"{FRONTEND_URL}/auth/signin?error=missing_code")
            
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code'
        }
        
        try:
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
        except requests.exceptions.RequestException:
            return request.redirect(f"{FRONTEND_URL}/auth/signin?error=token_exchange_failed")
            
        access_token = tokens.get('access_token')
        
        # Verify the ID token and fetch user info
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {'Authorization': f'Bearer {access_token}'}
        
        try:
            userinfo_resp = requests.get(userinfo_url, headers=headers)
            userinfo_resp.raise_for_status()
            userinfo = userinfo_resp.json()
        except requests.exceptions.RequestException:
            return request.redirect(f"{FRONTEND_URL}/auth/signin?error=userinfo_fetch_failed")
            
        email = userinfo.get('email')
        if not email:
            return request.redirect(f"{FRONTEND_URL}/auth/signin?error=no_email")
            
        # Find employee by verified email in res.users
        user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
        
        # Apply Odoo RBAC
        if not user or not user.active:
            return request.redirect(f"{FRONTEND_URL}/auth/signin?error=unauthorized_email")
            
        # Create Odoo session
        request.update_env(user=user.id)
        request.session.uid = user.id
        request.session.login = user.login
        request.session.session_token = user._compute_session_token(request.session.sid)
        
        # Redirect to Dashboard
        return request.redirect(f"{FRONTEND_URL}/")
