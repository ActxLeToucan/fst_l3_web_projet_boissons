<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreationTables extends AbstractMigration
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
        // Structure for table `gender`
        $gender = $this->table('gender', ['signed' => true]);
        $gender->addColumn('name', 'string', ['limit' => 32, 'null' => false]);
        $gender->create();

        // Structure for table `user`
        $user = $this->table('user', ['signed' => true]);
        $user->addColumn('login', 'string', ['limit' => 64, 'null' => false])
            ->addColumn('password', 'text', ['null' => false])
            ->addColumn('firstname', 'string', ['limit' => 32])
            ->addColumn('lastname', 'string', ['limit' => 32])
            ->addColumn('birthdate', 'date')
            ->addColumn('email', 'string', ['limit' => 64])
            ->addColumn('phone', 'string', ['limit' => 32])
            ->addColumn('city', 'string', ['limit' => 32])
            ->addColumn('zip', 'string', ['limit' => 8])
            ->addColumn('address', 'string', ['limit' => 64])
            ->addColumn('gender_id', 'integer', ['null' => true]);
        $user->create();

        // Structure for table `recipe`
        $recipe = $this->table('recipe', ['signed' => true]);
        $recipe->addColumn('title', 'string', ['limit' => 64, 'null' => false])
            ->addColumn('preparation', 'text', ['null' => false]);
        $recipe->create();

        // Structure for table `favorite`
        $favorite = $this->table('favorite', ['id' => false, 'primary_key' => ['user_id', 'recipe_id']]);
        $favorite->addColumn('user_id', 'integer', ['null' => false])
            ->addColumn('recipe_id', 'integer', ['null' => false]);
        $favorite->create();

        // Structure for table `ingredient`
        $ingredient = $this->table('ingredient', ['signed' => true]);
        $ingredient->addColumn('aliment_id', 'integer', ['null' => false])
            ->addColumn('recipe_id', 'integer', ['null' => false])
            ->addColumn('quantity', 'integer', ['null' => false])
            ->addColumn('unit', 'string', ['limit' => 8, 'null' => false]);

        // Structure for table `aliment`
        $aliment = $this->table('aliment', ['signed' => true]);
        $aliment->addColumn('name', 'string', ['limit' => 64, 'null' => false]);
        $aliment->create();

        // Structure for table `category`
        $category = $this->table('category', ['id' => false, 'primary_key' => ['aliment_id', 'aliment_inf']]);
        $category->addColumn('aliment_id', 'integer', ['null' => false])
            ->addColumn('aliment_inf', 'integer', ['null' => false]);
        $category->create();


        // Indexes for table `user`
        $user->addIndex(['gender_id'])
            ->save();

        // Indexes for table `ingredient`
        $ingredient->addIndex(['aliment_id'])
            ->addIndex(['recipe_id'])
            ->save();


        // Constraints for table `user`
        $user->addForeignKey('gender_id', 'gender', 'id', ['delete' => 'SET_NULL', 'update' => 'CASCADE'])
            ->save();
        
        // Constraints for table `favorite`
        $favorite->addForeignKey('user_id', 'user', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('recipe_id', 'recipe', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->save();
        
        // Constraints for table `ingredient`
        $ingredient->addForeignKey('aliment_id', 'aliment', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('recipe_id', 'recipe', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->save();

        // Constraints for table `category`
        $category->addForeignKey('aliment_id', 'aliment', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->addForeignKey('aliment_inf', 'aliment', 'id', ['delete' => 'CASCADE', 'update' => 'CASCADE'])
            ->save();

    }
}
