<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class Users extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change()
    {
        $user = $this->table('user');
        $user->addColumn("level", "integer", ["default" => 0])
            ->addColumn("token", "text", ["null" => true])
            ->update();

        // insert default user
        $user->insert([
            "login" => "admin",
            "password" => password_hash("admin", PASSWORD_DEFAULT),
            "level" => 1,
            "token" => null
        ])->save();

        // insert genders
        $gender = $this->table('gender');
        $gender->insert([
            ["name" => "Homme"],
            ["name" => "Femme"],
            ["name" => "Autre"]
        ])->save();
    }
}
