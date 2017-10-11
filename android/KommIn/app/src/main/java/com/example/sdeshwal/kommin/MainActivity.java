package com.example.sdeshwal.kommin;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

public class MainActivity extends Activity {

	private WebView mWebView;
	ProgressBar progressBar;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		mWebView = findViewById(R.id.activity_main_web_view);

		progressBar = findViewById(R.id.progressBar1);

		WebSettings webSettings = mWebView.getSettings();
		webSettings.setJavaScriptEnabled(true);
		mWebView.setWebViewClient(new HelloWebViewClient());
		mWebView.loadUrl("https://pro.kom-inn.org/som/gjest");
	}

	private class HelloWebViewClient extends WebViewClient{


		@Override
		public void onPageStarted(WebView view, String url, Bitmap favicon) {
			// TODO Auto-generated method stub
			super.onPageStarted(view, url, favicon);
		}

		@Override
		public boolean shouldOverrideUrlLoading(WebView webView, String url)
		{
			webView.loadUrl(url);
			return true;
		}

		@Override
		public void onPageFinished(WebView view, String url) {
			// TODO Auto-generated method stub
			super.onPageFinished(view, url);

			progressBar.setVisibility(view.GONE);
		}

	}


	@Override
	public boolean onKeyDown(int keyCode, KeyEvent event)
	{
		if((keyCode == KeyEvent.KEYCODE_BACK)&& mWebView.canGoBack())
		{
			mWebView.goBack();
			return true;

		}

		return super.onKeyDown(keyCode, event);

	}

	public void onBackPressed() {
		AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(
			MainActivity.this);

		alertDialogBuilder.setTitle("Exit");

		alertDialogBuilder
			.setMessage("Do you really want to exit?")
			.setCancelable(false)
			.setPositiveButton("Yes",new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog,int id) {
					MainActivity.this.finish();
				}
			})
			.setNegativeButton("No",new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog,int id) {
					dialog.cancel();
				}
			});

		AlertDialog alertDialog = alertDialogBuilder.create();

		alertDialog.show();
	}
}
