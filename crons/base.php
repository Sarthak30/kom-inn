<?php

require_once __DIR__ . '/vendor/autoload.php';

$options = app\Cli::get_console_commands();
if ($options['help']) {
    echo PHP_EOL.
        "Usage:".
        PHP_EOL . PHP_EOL .
        "  $ php " . $argv[0] . " [-(v|h|d)] [--(verbose|help|dry)] [-(m)=<value>] [--(max) <value>]" .
        PHP_EOL . PHP_EOL . PHP_EOL .
        "  h | help : this message" . PHP_EOL .
        "  v | verbose : output information about each mail sent" . PHP_EOL .
        "  d | dry : output info on what would have been done, but send nothing" . PHP_EOL .
        "  m | max : limits the amount of mails to send to this number passed as value" . PHP_EOL;
    die();
}
define('RESOURCE_PATH', __DIR__ . '/../resources');

$app = new app\Cli($options);

$app['PHP_AUTH_USER'] = $argv[0];

$connection = require_once RESOURCE_PATH . '/connections.php';
$app->register(new Silex\Provider\DoctrineServiceProvider(), ['db.options' => $connection]);

$email_config = require_once RESOURCE_PATH . '/emails.php';
$app->register(new app\Mailer($email_config));

$app->register(new app\models\Hosts());
$app->register(new app\models\Matches());
$app->register(new app\models\People());
$app->register(new app\models\Emails());
