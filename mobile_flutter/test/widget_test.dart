import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/main.dart';

void main() {
  testWidgets('Counter increment smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MediGoApp(startWithNav: false));

    // Verify that our login screen is shown.
    expect(find.text('Bienvenue'), findsOneWidget);
  });
}
